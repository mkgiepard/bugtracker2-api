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
        stage ('testStart'){
            steps{
                sh '''
                npm testStart
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
                        git(
                            url: 'https://github.com/mkgiepard/bugtracker2-api-RESTAssured.git',
                            credentialsId: '3b8de3c5-cc7c-40eb-ae78-1b53959c7e9c',
                            branch: 'main'
                        )
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