pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checked out code'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy stage will be added next'
            }
        }
    }
}
