pipeline {
    agent any

    environment {
        IMAGE_NAME = "mkhan777717/backend"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        REGISTRY_CREDENTIALS = credentials('dockerhub-creds')
        DATABASE_URL = credentials('DATABASE_URL')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Run Migrations (test db)') {
            steps {
                sh 'npx prisma migrate deploy'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh """
                  docker pull ${IMAGE_NAME}:${IMAGE_TAG}
                  docker stop backend-app || true
                  docker rm backend-app || true
                  docker run -d --name backend-app \
                    -p 3000:3000 \
                    -e DATABASE_URL=${DATABASE_URL} \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
