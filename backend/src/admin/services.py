from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, case
from src.admin.models import Post, Subgroup
from fastapi import HTTPException, status
from src.auth.models import Member, Status
from src.admin.schemas import MemberAdminUpdate, MemberAdminCreate
from src.utils.auth import generate_password_hash
from src.utils.logger import logger
from uuid import UUID


class AdminServices:

    async def create_member_by_admin(
        self,
        member_data: MemberAdminCreate,
        session: AsyncSession
    ):
        if member_data.password != member_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        existing_member_statement = select(Member).where(Member.email == member_data.email.lower())
        existing_member_result = await session.exec(existing_member_statement)
        existing_member = existing_member_result.first()
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists"
            )

        new_member = Member(
            first_name=member_data.first_name,
            last_name=member_data.last_name,
            email=member_data.email,
            title=member_data.title,
            birth_day=member_data.birth_day,
            birth_month=member_data.birth_month,
            phone_number=member_data.phone_number,
            status=member_data.status,
            password_hash=generate_password_hash(member_data.password.strip()),
            email_verified=True,
            account_approved=True,
        )

        posts = []
        if member_data.post_ids is not None:
            requested_post_ids = list(set(member_data.post_ids))
            if requested_post_ids:
                post_statement = select(Post).where(Post.id.in_(requested_post_ids))
                post_result = await session.exec(post_statement)
                posts = post_result.all()

                if len(posts) != len(requested_post_ids):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="One or more selected posts do not exist"
                    )

        subgroups = []
        if member_data.subgroup_ids is not None:
            requested_subgroup_ids = list(set(member_data.subgroup_ids))
            if requested_subgroup_ids:
                subgroup_statement = select(Subgroup).where(Subgroup.id.in_(requested_subgroup_ids))
                subgroup_result = await session.exec(subgroup_statement)
                subgroups = subgroup_result.all()

                if len(subgroups) != len(requested_subgroup_ids):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="One or more selected subgroups do not exist"
                    )

        if posts:
            new_member.posts_held = posts
        if subgroups:
            new_member.subgroups = subgroups

        try:
            session.add(new_member)
            await session.commit()
            await session.refresh(new_member)
            return new_member
        except IntegrityError:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A member with this email or phone number already exists"
            )
        except Exception:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

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
        filters = [Member.account_approved == False]

        cleaned_search = search.strip() if search else None
        if cleaned_search:
            search_term = f"%{cleaned_search}%"
            filters.append(
                or_(
                    Member.first_name.ilike(search_term),
                    Member.last_name.ilike(search_term),
                    Member.email.ilike(search_term),
                    Member.phone_number.ilike(search_term)
                )
            )

        statement = (
            select(Member)
            .where(*filters)
            .options(
                selectinload(Member.subgroups),
                selectinload(Member.posts_held)
            )
            .order_by(Member.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await session.exec(statement)

        count_statement = select(func.count(Member.uid)).where(*filters)
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
