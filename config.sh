#!/bin/sh

# Para funcionar no Ubuntu é necessário alterar o chrome-sandbox para root
# e aplicar a permissão 4755 no chrome-sandbox

set -e

sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox

exit 0
