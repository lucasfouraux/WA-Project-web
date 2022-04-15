export default interface IOrder {
  id?: number;
  description: string;
  amount: number;
  value: string;

  createdDate?: Date;
  updatedDate?: Date;
}