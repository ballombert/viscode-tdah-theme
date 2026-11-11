from functools import cache

# Readable comments, parameters and decorators.
@cache
def greeting(name: str, count: int = 42) -> str:
    if name and count > 0:
        return f"Hello {name}: {count}"
    return ""
