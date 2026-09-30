from pydantic import BaseModel, Field


class CategoryInDb(BaseModel):
    id: str = Field(..., description="Unique category UUID")
    slug: str = Field(..., description="URL slug, e.g. coding-devops")
    title: str = Field(..., max_length=100)
    description: str = Field(..., description="Domain definition")
    icon_token: str = Field(..., max_length=50)
    display_order: int = Field(default=0)


class CategoryResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    icon_token: str
    display_order: int

