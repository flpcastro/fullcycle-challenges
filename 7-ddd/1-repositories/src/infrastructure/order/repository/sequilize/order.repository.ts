import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    const orderToUpdate = await OrderModel.findByPk(entity.id);
  
    if (!orderToUpdate) {
      throw new Error(`Order with id ${entity.id} not found`);
    }
  
    await orderToUpdate.update({
      customer_id: entity.customerId,
      total: entity.total(),
    });
  
    await OrderItemModel.destroy({ where: { order_id: entity.id } });
  
    await OrderItemModel.bulkCreate(
      entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }))
    );
  }

  async find(id: string): Promise<Order> {
    const orderData = await OrderModel.findOne({
      where: { id },
      include: [{ model: OrderItemModel }],
    });
  
    if (!orderData) {
      throw new Error(`Order with id ${id} not found`);
    }
  
    const items = orderData.items.map((item) => 
      new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    );
  
    const order = new Order(orderData.id, orderData.customer_id, items);
    return order;
  }
  

  async findAll(): Promise<Order[]> {
    const ordersData = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });
  
    return ordersData.map((orderData) => {
      const items = orderData.items.map((item) => 
        new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
      );
      return new Order(orderData.id, orderData.customer_id, items);
    });
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}
