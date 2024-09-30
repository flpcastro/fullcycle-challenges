import IEventHandler from "../../@shared/event-handler.interface";
import CustomerCreatedEvent from "../customer-created-1.event";

export default class LogWhenCustomerCreated1
  implements IEventHandler<CustomerCreatedEvent>
{
  handle(event: CustomerCreatedEvent): void {
    console.log("Esse é o primeiro console.log do evento: CustomerCreated");
  }
}
