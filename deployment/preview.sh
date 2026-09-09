#!/usr/bin/env bash
# Rebuild the site and push it to the preview at https://preview.nlp-tlp.org
#
# The preview is a plain nginx container on the NLP-TLP server, fed by the
# Cloudflare tunnel that already serves the group's other subdomains:
#   preview.nlp-tlp.org -> tunnel -> 127.0.0.1:3010 -> container nlptlp-preview
#   site root on the server: /home/pascal/services/nlptlp-preview/site
# It sends X-Robots-Tag: noindex so it can never compete with nlp-tlp.org in
# search. Production is still GitHub Pages, built from main.
set -e
HOST="${PREVIEW_HOST:-Home-NLPTLP-Server}"
BASE=/home/pascal/services/nlptlp-preview

npm run build
tar czf /tmp/preview-site.tgz -C _site .
scp -q /tmp/preview-site.tgz "$HOST":/tmp/
ssh "$HOST" "set -e
  rm -rf $BASE/site/* 
  tar xzf /tmp/preview-site.tgz -C $BASE/site 2>/dev/null
  rm -f /tmp/preview-site.tgz
  docker restart nlptlp-preview >/dev/null"
rm -f /tmp/preview-site.tgz
echo "preview updated: https://preview.nlp-tlp.org/"
