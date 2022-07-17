import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface KrakenEventBusProps {
	publisherFunction: IFunction;
	targetQueue: IQueue;
}

export class KrakenEventBus extends Construct {
	constructor(scope: Construct, id: string, props: KrakenEventBusProps) {
		super(scope, id);

		const bus = new EventBus(this, "KrakenEventBus", {
			eventBusName: "KrakenEventBus",
		});

		const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
			eventBus: bus,
			enabled: true,
			description: "When Basket microservice checkout the basket",
			eventPattern: {
				source: ["com.kraken.checkoutbasket"],
				detailType: ["CheckoutBasket"],
			},
			ruleName: "CheckoutBasketRule",
		});

		checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));

		bus.grantPutEventsTo(props.publisherFunction);
	}
}
