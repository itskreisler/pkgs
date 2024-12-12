#!/usr/bin/env bash

# set -e: En caso de algun comando con error, para y sale inmediatamente.
set -e
# Verificar si se proporcionó un argumento
if [ -z "$1" ]; then
  echo "Error: No se proporcionó una URL. Uso: $0 <url>" >&2
  exit 1
fi
cmtmssge=$(! [ -z $1 ] && echo "$1" || echo "$(date) - No message.") 
echo
echo ">> Descargando..."
echo
echo ">> url: \"$cmtmssge\""
yt-dlp "$cmtmssge" --audio-quality 0 --extract-audio --audio-format mp3 --output "./%(title)s.%(ext)s" --add-metadata --embed-thumbnail --no-playlist
