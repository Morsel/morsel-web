#! /bin/sh
deploy_dir=$1
git_repo=$2
push_shortcut=$3

if [[ ! -e $deploy_dir ]]; then
  mkdir $deploy_dir
  cd $deploy_dir
  if [ -d .git ]; then
    git init
  fi;
  git add .
  git commit -m "init"
  git remote add $push_shortcut $git_repo
fi

