# TechAlpaca

TechAlpaca is a personal publication about robotics research, AI, finance, and engineering practice. It is built with Next.js App Router and stores published writing in Git.

- Website: [www.alandodo.cn](https://www.alandodo.cn)
- Admin studio: `/admin/articles`
- Research: `/forum` · Notes: `/blog` · Resources: `/resources`

## Features

- Responsive home, Research, Notes, Resources, AI, Finance, and About pages
- Markdown and MDX article library with search, filters, RSS, sitemap, and article navigation
- Private article studio with local drafts, Markdown preview, export, and confirmed publishing to GitHub
- Admin resource manager that adds websites to the Git-backed resources directory
- Light and dark themes, accessible keyboard controls, and reduced-motion support

The admin studio requires server-side credentials. User accounts, community publishing, and Supabase-backed data are not implemented yet.

## Local development

Requirements: Node.js 24.x and npm.

```powershell
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep `.env.local` private; `.gitignore` excludes local environment files. The public site can run without Supabase configuration.

## Content

- Blog and research articles: `content/blog/*.md` or `*.mdx`
- Finance notes: `content/finance/`
- Local images: `public/images/`
- Resource directory data: `src/modules/content/resources-data.json`

Article metadata uses YAML frontmatter. For the supported fields, categories, and writing workflow, see [Content authoring](docs/development/content-authoring.md). The app sanitizes rendered HTML and does not execute MDX JSX.

## Admin publishing

Configure the variables in `.env.example` to enable admin login and server-side GitHub publishing:

- `ADMIN_EDITOR_PASSWORD`: private admin password
- `ADMIN_SESSION_SECRET`: random session signing key with at least 32 characters
- `GITHUB_TOKEN`: fine-grained token with Contents read/write access to this repository
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`: publishing target

The article studio saves drafts in the current browser. Publishing asks for confirmation and writes the current article to GitHub; if the remote version changed, the confirmation flow explicitly allows the current draft to replace it. The resource manager adds HTTPS websites to the repository data file. Both operations trigger the Git-connected Vercel deployment. Never expose these credentials with a `NEXT_PUBLIC_` prefix or commit their values.

## Commands

```bash
npm run dev           # Local development
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run content:audit # Article metadata and local image references
npm run build         # Production build
```

For the browser prelaunch check and security regression check, see [Development workflow](docs/development/workflow.md).

## Documentation

- [Development documentation index](docs/README.md)
- [Project and operations guide](docs/development/project-guide.md)
- [Deployment guide](docs/operations/deployment.md)
- [Security baseline](docs/architecture/security.md)
- [Product requirements and roadmap](docs/product/requirements.md)
- [Architecture and data model](docs/architecture/modules.md)
- [Migration and handoff](docs/development/migration.md)

## Deployment

The `main` branch is connected to Vercel. A push to `main` triggers a production build using Node.js 24.x, `npm install`, and `npm run build`. Keep production credentials in Vercel environment variables. Review [the deployment guide](docs/operations/deployment.md) before changing domains, environment variables, or project linkage.
