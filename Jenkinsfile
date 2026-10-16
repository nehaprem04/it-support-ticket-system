pipepline {
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
    }
}