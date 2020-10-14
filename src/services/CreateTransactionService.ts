// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction, { TransactionType } from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: TransactionType;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = new TransactionsRepository();
    const transactionsWithBalance = await transactionsRepository.getBalance();

    if(type === 'outcome' && value > transactionsWithBalance.balance.total) throw new AppError('Saldo insuficiente', 400);

    const categoryRepository = getRepository(Category);
    let categoryObject = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryObject) {
      categoryObject = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryObject);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryObject.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
