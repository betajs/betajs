#!/bin/sh
_DOCDIR="-Djsdoc.dir=$JSDOCDIR"
_APPDIR="$JSDOCDIR/app"
_BASEDIR="$JSDOCDIR"
_TDIR="-Djsdoc.template.dir=$JSDOCTEMPLATEDIR"
CMD="java $_DOCDIR $_TDIR -jar $_BASEDIR/jsrun.jar $_APPDIR/run.js ./src -d=./docs -r -s -p $@"
echo $CMD
$CMD

