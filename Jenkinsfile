pipeline {
    agent any

    environment {
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }


    stages {
        stage ('install modules'){
            steps{
                sh '''
                npm install --verbose -d 
                npm install --save classlist.js
                '''
            }
        }
        stage ('test'){
            steps{
                sh '''
                npm test
                '''
            }
        }
        stage('Checking out RESTAssured tests') {
            steps {
                sh 'mkdir -p deps/RESTAssured'
                dir('deps') {
                    dir('RESTAssured') {
                        git(url: 'https://github.com/mkgiepard/bugtracker2-api-RESTAssured.git', branch: 'master')
                    }
                }
            }
        }
        stage('RESTAssured test') {
            steps {
                dir('deps') {
                    dir('RESTAssured') {
                        sh 'mvn test'
                    }
                }
            }
        }
        stage('build') {
            steps {
                sh 'node --version'
            }
        }
    }
}