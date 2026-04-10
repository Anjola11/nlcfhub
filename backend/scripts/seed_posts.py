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
from src.admin.models import Post

POSTS = [
    "President",
    "Vice President",
    "General Secretary",
    "Workers Coordinator",
    "Sisters Coordinator",
    "Financial Secretary",
    "Treasurer",
    "Asst. General Secretary",
    "Welfare Coordinator",
    "Bible Study Coordinator",
    "FBS Principal",
    "Evangelism Coordinator",
    "Media and Editorial Head",
    "Choir Coordinator",
    "Sanctuary and Decorating Head",
    "Drama Coordinator",
    "Prayer Coordinator",
    "Academic Head",
    "Ushering Head and Librarian",
    "Organising and Technical Head",
    "A.R.O 1",
    "A.R.O 2",
    "UJCM Representative",
]

async def seed_posts():
    print("Seeding Posts...")
    async for session in get_session():
        try:
            for post_name in POSTS:
                # Check if post already exists
                stmt = select(Post).where(Post.name == post_name)
                result = await session.execute(stmt)
                existing_post = result.scalars().first()
                
                if not existing_post:
                    new_post = Post(name=post_name)
                    session.add(new_post)
                    print(f"Added Post: {post_name}")
                else:
                    print(f"Skipped Post (Already exists): {post_name}")
            
            await session.commit()
            print("Posts seeded successfully.")
        except DatabaseError as e:
            await session.rollback()
            print(f"Database error occurred: {e}")
        except Exception as e:
            await session.rollback()
            print(f"An unexpected error occurred: {e}")
        
        break # We only need the first yielded session

if __name__ == "__main__":
    asyncio.run(seed_posts())
