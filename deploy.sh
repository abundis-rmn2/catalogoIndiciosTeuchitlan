#!/bin/bash

# Build the project
npm run build

echo "Build complete! Your static site is ready in the dist/ directory."
echo "You can now upload these files to any web server."

# Optional: If you have a specific server to deploy to, add commands below
# For example, to copy to a remote server via SSH:
# rsync -avz --delete dist/ user@your-server:/path/to/web/directory/

# For GitHub Pages:
# If you're deploying to GitHub Pages, you might want to add:
# git subtree push --prefix dist origin gh-pages
