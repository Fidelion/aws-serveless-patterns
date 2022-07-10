import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface KrakenApiGatewayProps {
	productMicroservice: IFunction;
	basketMicroservice: IFunction;
	orderMicroservice: IFunction;
}

export class KrakenApiGateway extends Construct {
	constructor(scope: Construct, id: string, props: KrakenApiGatewayProps) {
		super(scope, id);

		this.createProductGateway(props.productMicroservice);
		this.createBasketGateway(props.basketMicroservice);
		this.createOrderGateway(props.orderMicroservice);
	}

	private createProductGateway(productMicroservice: IFunction) {
		// Product microservices api gateway
		// root name = product

		// GET /product
		// POST /product

		// Single product with id parameter
		// GET /product/{id}
		// PUT /product/{id}
		// DELETE /product/{id}

		const productGw = new LambdaRestApi(this, "productApi", {
			restApiName: "ProductService",
			handler: productMicroservice,
			proxy: false,
		});

		const product = productGw.root.addResource("product");
		product.addMethod("GET");
		product.addMethod("POST");

		const singleProduct = product.addResource("{id}"); // product/{id}
		singleProduct.addMethod("GET"); // GET /product/{id}
		singleProduct.addMethod("PUT"); // PUT /product/{id}
		singleProduct.addMethod("DELETE"); // DELETE /product/{id}
	}

	private createBasketGateway(basketMicroservice: IFunction) {
		// Basket microservices api gateway
		// root name = basket

		// GET /basket
		// POST /basket

		// Single basket with userName parameter - resource name = basket/{userName}
		// GET /basket/{userName}
		// DELETE /basket/{userName}

		// checkout basket async flow
		// POST /basket/checkout

		const basketGw = new LambdaRestApi(this, "basketApi", {
			restApiName: "BasketService",
			handler: basketMicroservice,
			proxy: false,
		});

		const basket = basketGw.root.addResource("basket");
		basket.addMethod("GET");
		basket.addMethod("POST");

		const singleBasket = basket.addResource("{userName}"); // product/{userName}
		singleBasket.addMethod("GET"); // GET /basket/{userName}
		singleBasket.addMethod("DELETE"); // DELETE /basket/{userName}

		const basketCheckout = basket.addResource("checkout");
		basketCheckout.addMethod("POST"); // POST /basket/checkout
		// expected request payload : { userName : swn }
	}

	private createOrderGateway(orderMicroservice: IFunction) {
		// Ordering microservices api gateway
		// root name = basket
		// GET /order
		// GET /order/{userName}
		// expected request : xxx/order/swn?orderDate=timestamp
		// ordering ms grap input and query parameters and filter to dynamodb

		const orderGw = new LambdaRestApi(this, "orderApi", {
			restApiName: "OrderService",
			handler: orderMicroservice,
			proxy: false,
		});

		const order = orderGw.root.addResource("order");
		order.addMethod("GET");
		order.addMethod("POST");

		const singleOrder = order.addResource("{userName}"); // order/{userName}
		singleOrder.addMethod("GET"); // GET /order/{userName}
		// expected request : xxx/order/swn?orderDate=timestamp
		// ordering ms grap input and query parameters and filter to dynamo db

		return singleOrder;
	}
}
