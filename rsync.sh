REMOTE_ROOT='/data/meitaospider'
CURRENT_PATH="$PWD"
RELEASE_ROOT=$CURRENT_PATH
IgnoreFile=$CURRENT_PATH'/.gitignore'
echo "rsync start"
rsync -av --exclude-from="$IgnoreFile" "$RELEASE_ROOT/" -e 'ssh -p 22' root@114.215.207.133:$REMOTE_ROOT
echo "rsync end"
