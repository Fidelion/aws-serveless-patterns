import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface KrakenMicroservicesProps {
	productTable: ITable;
	basketTable: ITable;
	orderTable: ITable;
}

export class KrakenMicroservices extends Construct {
	public readonly productMicroservice: NodejsFunction;
	public readonly basketMicroservice: NodejsFunction;
	public readonly orderMicroservice: NodejsFunction;

	constructor(scope: Construct, id: string, props: KrakenMicroservicesProps) {
		super(scope, id);

		this.productMicroservice = this.createProductLambdaFunction(
			props.productTable
		);
		this.basketMicroservice = this.createBasketLambdaFunction(
			props.basketTable
		);

		this.orderMicroservice = this.createOrderLambdaFunction(props.orderTable);
	}

	private createProductLambdaFunction(productTable: ITable): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				PRIMARY_KEY: "id",
				DYNAMODB_TABLE_NAME: productTable.tableName,
			},
			runtime: Runtime.NODEJS_14_X,
		};

		const productFunction = new NodejsFunction(this, "productLambdaFunction", {
			entry: join(__dirname, "/../src/product/index.js"),
			...nodeJsFunctionProps,
		});

		productTable.grantReadWriteData(productFunction);

		return productFunction;
	}

	private createBasketLambdaFunction(basketTable: ITable): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				PRIMARY_KEY: "id",
				DYNAMODB_TABLE_NAME: basketTable.tableName,
				EVENT_SOURCE: "com.kraken.checkoutbasket",
				EVENT_DETAIL_TYPE: "CheckoutBasket",
				EVENT_BUS_NAME: "KrakenEventBus",
			},
			runtime: Runtime.NODEJS_14_X,
		};

		const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
			entry: join(__dirname, "/../src/basket/index.js"),
			...nodeJsFunctionProps,
		});

		basketTable.grantReadWriteData(basketFunction);

		return basketFunction;
	}

	private createOrderLambdaFunction(orderTable: ITable): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				PRIMARY_KEY: "userName",
				SORT_KEY: "orderDate",
				DYNAMODB_TABLE_NAME: orderTable.tableName,
			},
			runtime: Runtime.NODEJS_14_X,
		};

		const orderFunction = new NodejsFunction(this, "orderLambdaFunction", {
			entry: join(__dirname, "/../src/order/index.js"),
			...nodeJsFunctionProps,
		});

		orderTable.grantReadWriteData(orderFunction);

		return orderFunction;
	}
}
