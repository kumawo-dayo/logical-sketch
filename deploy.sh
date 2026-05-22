#!/bin/sh
set -e
git push
vercel pull --yes --environment production --scope shkumazawa-5203s-projects
vercel build --prod --yes --scope shkumazawa-5203s-projects
vercel deploy --prebuilt --prod --scope shkumazawa-5203s-projects --yes
