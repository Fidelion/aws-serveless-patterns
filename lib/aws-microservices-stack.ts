import { Stack, StackProps } from "aws-cdk-lib";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { KrakenDatabase } from "./database";
import { KrakenEventBus } from "./eventbus";
import { KrakenApiGateway } from "./gateway";
import { KrakenMicroservices } from "./microservices";

export class AwsMicroservicesStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const database = new KrakenDatabase(this, "Database");

		const microservices = new KrakenMicroservices(this, "Microservices", {
			productTable: database.productTable,
			basketTable: database.basketTable,
			orderTable: database.orderTable,
		});

		const apiGateway = new KrakenApiGateway(this, "ApiGateway", {
			productMicroservice: microservices.productMicroservice,
			basketMicroservice: microservices.basketMicroservice,
			orderMicroservice: microservices.orderMicroservice,
		});

		const evetBus = new KrakenEventBus(this, "EventBridge", {
			publisherFunction: microservices.basketMicroservice,
			targetFunction: microservices.orderMicroservice,
		});
	}
}
