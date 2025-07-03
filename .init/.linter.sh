#!/bin/bash
cd /home/kavia/workspace/code-generation/fileinsight-104799-104810/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

