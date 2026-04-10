import asyncio
import sys
from pathlib import Path
from sqlmodel import select
from sqlalchemy.exc import DatabaseError

# Ensure backend root is in sys.path
if __package__ is None or __package__ == "":
    backend_root = Path(__file__).resolve().parents[1]
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

from src.db.main import get_session
from src.admin.models import Subgroup

SUBGROUPS = [
    "Choir (TKW)",
    "Media and Editorial",
    "Ushering subgroup",
    "Prayer subgroup",
    "Academic subgroup",
    "Sanctuary and Decorating",
    "Drama subgroup",
    "Evangelism subgroup",
    "Organising and Technical",
    "Bible Study subgroup",
    "Foundation Bible School (FBS)",
    "Welfare subgroup",
]

async def seed_subgroups():
    print("Seeding Subgroups...")
    async for session in get_session():
        try:
            for subgroup_name in SUBGROUPS:
                # Check if subgroup already exists
                stmt = select(Subgroup).where(Subgroup.name == subgroup_name)
                result = await session.execute(stmt)
                existing_subgroup = result.scalars().first()
                
                if not existing_subgroup:
                    new_subgroup = Subgroup(name=subgroup_name)
                    session.add(new_subgroup)
                    print(f"Added Subgroup: {subgroup_name}")
                else:
                    print(f"Skipped Subgroup (Already exists): {subgroup_name}")
            
            await session.commit()
            print("Subgroups seeded successfully.")
        except DatabaseError as e:
            await session.rollback()
            print(f"Database error occurred: {e}")
        except Exception as e:
            await session.rollback()
            print(f"An unexpected error occurred: {e}")
            
        break # We only need the first yielded session

if __name__ == "__main__":
    asyncio.run(seed_subgroups())
