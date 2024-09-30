import { Sequelize } from "sequelize-typescript";
import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/order-item";
import Product from "../../domain/entity/product";
import CustomerModel from "../database/sequelize/model/customer.model";
import OrderItemModel from "../database/sequelize/model/order-item.model";
import OrderModel from "../database/sequelize/model/order.model";
import ProductModel from "../database/sequelize/model/product.model";
import CustomerRepository from "./customer.repository";
import OrderRepository from "./order.repository";
import ProductRepository from "./product.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.id,
      product.name,
      product.price,
      2
    );

    const order = new Order(customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customerId: customer.id,
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          orderId: order.id,
          productId: product.id,
        },
      ],
    });
  });

  it("should find a order by id", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.id,
      product.name,
      product.price,
      2
    );

    const order = new Order(customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderResult = await orderRepository.findById(order.id);

    expect(order).toStrictEqual(orderResult);
  });

  it("should update a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "customer");
    const address = new Address("Street 1", 1, "123456", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "produto 1", 100);
    await productRepository.create(product);

    const orderRepository = new OrderRepository();
    const item = new OrderItem("123", product.id, product.name, 1, 100);
    const order = new Order(customer.id, [item]);

    await orderRepository.create(order);

    const product2 = new Product("456", "produto 1", 300);
    await productRepository.create(product2);

    const item2 = new OrderItem(
      "456",
      product2.id,
      product2.name,
      product2.price,
      3
    );
    order.addItem(item2);

    order.removeItem(item.id);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customerId: customer.id,
      total: order.total(),
      items: [
        {
          id: item2.id,
          orderId: order.id,
          productId: product2.id,
          quantity: item2.quantity,
          name: item2.name,
          price: item2.price,
        },
      ],
    });
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "customer");
    const address = new Address("Street 1", 1, "1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("321", "customer 2");
    const address2 = new Address("Street 2", 2, "12", "City 2");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);

    const productRepository = new ProductRepository();
    const product = new Product("P1", "Product 1", 30);
    await productRepository.create(product);

    const product2 = new Product("P2", "Product 2", 200);
    await productRepository.create(product2);

    const orderRepository = new OrderRepository();

    const item = new OrderItem(
      "OI1",
      product.id,
      product.name,
      product.price,
      3
    );
    const order = new Order(customer.id, [item]);
    await orderRepository.create(order);

    const item2 = new OrderItem(
      "OI2",
      product2.id,
      product2.name,
      product2.price,
      4
    );
    const order2 = new Order(customer2.id, [item2]);
    await orderRepository.create(order2);

    const findAll = await orderRepository.findAll();
    const orderList = [order, order2];

    expect(orderList).toEqual(findAll);
    expect(findAll).toHaveLength(2);
  });
});
