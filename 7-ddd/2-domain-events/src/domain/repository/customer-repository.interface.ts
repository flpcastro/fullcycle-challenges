import Customer from "../entity/customer";
import RepositoryInterface from "./repository.interface";

export default interface ICustomerRepository
  extends RepositoryInterface<Customer> {}
