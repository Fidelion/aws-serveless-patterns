import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface KrakenEventBusProps {
	publisherFunction: IFunction;
	targetFunction: IFunction;
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

		checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction));

		bus.grantPutEventsTo(props.publisherFunction);
	}
}
