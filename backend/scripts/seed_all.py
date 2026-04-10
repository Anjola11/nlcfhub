import asyncio
import sys
from pathlib import Path

# Ensure backend root is in sys.path
if __package__ is None or __package__ == "":
    backend_root = Path(__file__).resolve().parents[1]
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

from scripts.seed_posts import seed_posts
from scripts.seed_subgroups import seed_subgroups

async def main():
    print("Starting Main Seeder...")
    print("-" * 30)
    await seed_posts()
    print("-" * 30)
    await seed_subgroups()
    print("-" * 30)
    print("Database fully seeded.")

if __name__ == "__main__":
    asyncio.run(main())
