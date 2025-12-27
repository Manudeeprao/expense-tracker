pipeline {
    agent any

    stages {

        stage('Stop Old Containers') {
            steps {
                dir('.') {
                    sh 'docker-compose down || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('.') {
                    sh 'docker-compose build'
                }
            }
        }

        stage('Run Containers') {
            steps {
                dir('.') {
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo 'Docker containers are up and running 🚀'
        }
        failure {
            echo 'Pipeline failed ❌'
        }
    }
}
