# Search module

The initial search use case is implemented in `src/modules/content` over local MDX. This module is reserved for a stable search API if the index moves to PostgreSQL full-text search or another provider. Keep result types independent from the index backend.
