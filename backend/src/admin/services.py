from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, case
from src.admin.models import Post, Subgroup
from fastapi import HTTPException, status
from src.auth.models import Member, Status
from src.admin.schemas import MemberAdminUpdate
from src.utils.logger import logger
from uuid import UUID


class AdminServices:

    async def _get_member_or_404(self, member_uid: UUID, session: AsyncSession) -> Member:
        member = await session.get(Member, member_uid)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member with uid {member_uid} not found",
            )
        return member

    async def get_all_pending_members(
        self,
        session: AsyncSession,
        search: str | None = None,
        limit: int = 25,
        offset: int = 0
    ):
       



        statement = (
            select(Member)
            .where(Member.account_approved == False)
            .options(
                selectinload(Member.subgroups),
                selectinload(Member.posts_held)
            )
            .order_by(Member.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.exec(statement)

        count_statement = select(func.count(Member.uid)).where(Member.account_approved == False)
        total = (await session.exec(count_statement)).one()

        return result.all(), total

    async def get_all_approved_members(
        self,
        session: AsyncSession,
        search: str | None = None,
        status_filter: str = None,
        birth_month: int = None,
        limit: int = 50,
        offset: int = 0
    ):
        filters = [Member.account_approved == True]

        cleaned_search = search.strip() if search else None
        if cleaned_search:
            search_term = f"%{cleaned_search}%"
            filters.append(
                or_(
                    Member.first_name.ilike(search_term),
                    Member.last_name.ilike(search_term),
                    Member.email.ilike(search_term)
                )
            )

        if status_filter:
            filters.append(Member.status == status_filter)
        if birth_month:
            filters.append(Member.birth_month == birth_month)

        statement = (
            select(Member)
            .where(*filters)
            .options(
                selectinload(Member.posts_held),
                selectinload(Member.subgroups)
            )
            .order_by(Member.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await session.exec(statement)

        count_statement = select(func.count(Member.uid)).where(*filters)
        total = (await session.exec(count_statement)).one()

        return result.all(), total

    async def get_upcoming_birthdays(self, session: AsyncSession, limit: int = 5):
        """
        Retrieves upcoming birthdays across the entire database using a SQL case sort
        to handle year wrap-around (e.g., showing January when in December).
        """
        from datetime import datetime, timezone, timedelta

        # Lagos Time (UTC+1)
        lagos_tz = timezone(timedelta(hours=1))
        today = datetime.now(lagos_tz)
        current_month = today.month
        current_day = today.day

        # Weighting logic: happen this year (0) vs. happened already/next year (1)
        is_next_year = case(
            (Member.birth_month > current_month, 0),
            ((Member.birth_month == current_month) & (Member.birth_day >= current_day), 0),
            else_=1
        )

        statement = (
            select(Member)
            .where(Member.account_approved == True)
            .options(
                selectinload(Member.posts_held),
                selectinload(Member.subgroups)
            )
            .order_by(
                is_next_year,
                Member.birth_month,
                Member.birth_day
            )
            .limit(limit)
        )

        result = await session.exec(statement)
        return result.all()

    async def approve_member(self, member_uid: UUID, session: AsyncSession):
        member = await self._get_member_or_404(member_uid, session)
        member.account_approved = True
        session.add(member)
        await session.commit()
        await session.refresh(member)
        return member

    async def reject_member(self, member_uid: UUID, session: AsyncSession):
        member = await self._get_member_or_404(member_uid, session)
        await session.delete(member)
        await session.commit()
        return {"success": True, "message": "Member rejected and removed successfully"}

    async def delete_member(self, member_uid: UUID, session: AsyncSession):
        member = await self._get_member_or_404(member_uid, session)
        await session.delete(member)
        await session.commit()
        return {"success": True, "message": "Member deleted successfully"}

    async def get_member_details(self, member_uid: UUID, session: AsyncSession):
        statement = (
            select(Member)
            .where(Member.uid == member_uid)
            .options(
                selectinload(Member.posts_held),
                selectinload(Member.subgroups)
            )
        )
        result = await session.exec(statement)
        member = result.first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member with uid {member_uid} not found",
            )
        return member

    async def edit_member_details(
        self,
        member_uid: UUID,
        member_data: MemberAdminUpdate,
        session: AsyncSession
    ):
        # Must eager-load relationships so we can overwrite them
        statement = (
            select(Member)
            .where(Member.uid == member_uid)
            .options(
                selectinload(Member.posts_held),
                selectinload(Member.subgroups)
            )
        )
        result = await session.exec(statement)
        member = result.first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )

        # 1. Update scalar fields (names, email, etc.)
        #    Exclude relationship IDs — sqlmodel_update would silently ignore them
        update_dict = member_data.model_dump(
            exclude_unset=True,
            exclude={"post_ids", "subgroup_ids"}
        )
        member.sqlmodel_update(update_dict)

        # 2. Explicitly handle Posts relationship update
        if member_data.post_ids is not None:
            if not member_data.post_ids:
                member.posts_held = []  # Admin cleared all posts
            else:
                post_stmt = select(Post).where(Post.id.in_(member_data.post_ids))
                posts = (await session.exec(post_stmt)).all()
                member.posts_held = list(posts)

        # 3. Explicitly handle Subgroups relationship update
        if member_data.subgroup_ids is not None:
            if not member_data.subgroup_ids:
                member.subgroups = []  # Admin cleared all subgroups
            else:
                sub_stmt = select(Subgroup).where(Subgroup.id.in_(member_data.subgroup_ids))
                subgroups = (await session.exec(sub_stmt)).all()
                member.subgroups = list(subgroups)

        session.add(member)
        await session.commit()
        await session.refresh(member)
        return member

    async def get_all_posts(self, session: AsyncSession):
        statement = select(Post)
        result = await session.exec(statement)
        return result.all()

    async def get_all_subgroups(self, session: AsyncSession):
        statement = select(Subgroup)
        result = await session.exec(statement)
        return result.all()

    async def get_dashboard_stats(self, session: AsyncSession):
        """
        Executes a single aggregate query for dashboard counts.
        """
        statement = select(
            func.count(Member.uid).label("total_members"),
            func.sum(case((Member.account_approved == False, 1), else_=0)).label("total_pending"),
            func.sum(case((Member.account_approved == True, 1), else_=0)).label("total_approved"),
            func.sum(
                case(
                    ((Member.account_approved == True) & (Member.status == Status.STUDENT), 1),
                    else_=0
                )
            ).label("total_students"),
            func.sum(
                case(
                    ((Member.account_approved == True) & (Member.status == Status.ALUMNI), 1),
                    else_=0
                )
            ).label("total_alumni")
        )
        result = (await session.exec(statement)).one()

        return {
            "total_pending": int(result.total_pending or 0),
            "total_approved": int(result.total_approved or 0),
            "total_students": int(result.total_students or 0),
            "total_alumni": int(result.total_alumni or 0)
        }
