#!/bin/bash

set -e

TMUX=tmux
SESSION=graphwalker
export GRAPHWALKER_RENDER_SETTINGS=`pwd`/etc/render_settings.json

exec_yarn_script () {
  window_name=$1
  script_command=$2

  $TMUX send-keys -t $window_name 'nvm use' C-m
  $TMUX send-keys -t $window_name "yarn ${script_command}" C-m
}

# abort if the session already exists
if [ -n "$(tmux list-sessions | grep $SESSION)" ]
then
  echo "Session $SESSION already exists" >&2
  exit 1
fi

# start a new session with the backend webapp
WINDOW_NAME='backend'
$TMUX new-session -d -s $SESSION -n $WINDOW_NAME

# start the graph database
$TMUX send-keys -t $WINDOW_NAME 'docker-compose run --rm --service-ports db' C-m

$TMUX split-window -t 0 -h


# start the express server in watch mode
exec_yarn_script $WINDOW_NAME 'watch-web'

$TMUX split-window -t 0 -v

# start the watch build server
exec_yarn_script $WINDOW_NAME 'watch-build-server'

# start a new window with the frontend
WINDOW_NAME='frontend'
$TMUX new-window -n $WINDOW_NAME
exec_yarn_script $WINDOW_NAME 'watch-build-client'

# start a new window for executing any
WINDOW_NAME='ad-hoc'
$TMUX new-window -n $WINDOW_NAME
exec_yarn_script $WINDOW_NAME 'todos'

# Attach Session, on the backend window
$TMUX attach-session -t $SESSION:0
