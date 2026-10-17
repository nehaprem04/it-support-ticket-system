pipeline {
    agent any
    environment{
        DOCKERHUB_USER = 'nehaprem'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Test Backend') {
            steps {
                bat 'docker compose run --rm backend python -c "import app; print(app.app)"'     
            }
        }

        stage("Push Images to DOCKERHUB") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ])
                    {
                        bat 'echo %DOCKER_PASS% | docker login -u "%DOCKER_USER%" -p "%DOCKER_PASS%"'
                        bat 'docker tag backendimage:latest %DOCKERHUB_USER%/backendimage:%BUILD_NUMBER%'
                        bat 'docker tag frontendimage:latest %DOCKERHUB_USER%/frontendimage:%BUILD_NUMBER%'
                        bat 'docker push %DOCKERHUB_USER%/backendimage:%BUILD_NUMBER%'
                        bat 'docker push %DOCKERHUB_USER%/frontendimage:%BUILD_NUMBER%'
                    }
            }
        }

        stage("Deploy to Azure") {
            steps{
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'azure-vm-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]){
                    bat """
                            ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@40.81.233.233 "cd ~/ticket-app && export IMAGE_TAG=%BUILD_NUMBER% && docker compose pull && docker compose up -d"
                    """
                }
            }
        }
    }
}