pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo '✅ Code checked out'
            }
        }

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

        stage('Deploy with Docker Compose') {
            steps {
                dir('.') {
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
