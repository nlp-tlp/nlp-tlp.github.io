#!/usr/bin/env bash
# Rebuild the site and push it to https://preview.nlp-tlp.org
#
# The preview is a plain nginx container on the NLP-TLP server, fed by the
# Cloudflare tunnel that already serves the group's other subdomains:
#   preview.nlp-tlp.org -> tunnel -> 127.0.0.1:3010 -> container nlptlp-preview
#   site root on the server: /home/pascal/services/nlptlp-preview/site
# It sends X-Robots-Tag: noindex so it can never compete with nlp-tlp.org in
# search. Production is still GitHub Pages, built from main.
#
# The server is only reachable directly from the home LAN, so when that fails
# this falls back to the p18 jump box, which reaches it from anywhere over the
# Cloudflare tunnel. Both hops verify the tarball's checksum.
set -e

DIRECT_HOST="${PREVIEW_HOST:-Home-NLPTLP-Server}"
JUMP_HOST="${PREVIEW_JUMP:-p18}"
SERVER="${PREVIEW_SERVER:-pascal@192.168.1.139}"
BASE=/home/pascal/services/nlptlp-preview
TGZ=/tmp/preview-site.tgz

npm run build
tar czf "$TGZ" -C _site . 2>/dev/null
SUM=$(shasum -a 256 "$TGZ" | cut -d' ' -f1)
echo "tarball $SUM"

apply() {  # runs on the app server
  cat <<APPLY
set -e
echo "$SUM  $TGZ" | sha256sum -c - > /dev/null
rm -rf $BASE/site/*
tar xzf $TGZ -C $BASE/site 2>/dev/null
rm -f $TGZ
docker restart nlptlp-preview > /dev/null
echo "files: \$(find $BASE/site -type f | wc -l)"
APPLY
}

if scp -q -o ConnectTimeout=10 "$TGZ" "$DIRECT_HOST":"$TGZ" 2>/dev/null; then
  echo "route: direct"
  apply | ssh "$DIRECT_HOST" bash -s
else
  echo "route: via $JUMP_HOST (direct LAN unreachable)"
  scp -q -o ConnectTimeout=30 "$TGZ" "$JUMP_HOST":"$TGZ"
  apply > /tmp/preview-apply.sh
  scp -q /tmp/preview-apply.sh "$JUMP_HOST":/tmp/preview-apply.sh
  ssh "$JUMP_HOST" "
    set -e
    scp -o StrictHostKeyChecking=no $TGZ $SERVER:$TGZ
    scp -o StrictHostKeyChecking=no /tmp/preview-apply.sh $SERVER:/tmp/preview-apply.sh
    ssh -o StrictHostKeyChecking=no $SERVER 'bash /tmp/preview-apply.sh; rm -f /tmp/preview-apply.sh'
    rm -f $TGZ /tmp/preview-apply.sh"
  rm -f /tmp/preview-apply.sh
fi

rm -f "$TGZ"
echo "preview updated: https://preview.nlp-tlp.org/"
