all: require prepare install message

require:
	@echo "===> Checking if necessary programs are available for starting the application..."
	@npm --version >/dev/null 2>&1 || (echo "ERROR: npm version check failed. npm is required. Please install npm & node"; exit 1)
	@webpack --version >/dev/null 2>&1 || (echo "ERROR: webpack version check failed. Please ensure webpack & webpack-cli is installed globally"; exit 1)

prepare:
	@echo "===> Preparing your directory for application"
	@mkdir -p creds
	@touch sessions
	@cp .env_sample .env
	@mkdir -p client/dist/
	@cp client/.env_sample client/.env

install:
	@echo "===> Installing client packages.."
	cd client && npm install
	@echo "===> Installing root packages"
	npm install

prestart:
	@echo "===> Performing some prestart operation.."
	npm run prestart

message:
	@echo "\n\n===> All steps completed. Please fill the values in .env file present at project root and inside client/ folder."
	@echo "Once env variables are set, please run 'make prestart' to perform some final steps"
