import { EntityRepository, getRepository, Repository } from 'typeorm';

import Transaction, { TransactionType } from '../models/Transaction';

interface TransactionsWithBalance {
  transactions: Transaction[];
  balance: Balance;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<TransactionsWithBalance> {

    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    const income = transactions.reduce((total, transaction) => {
      if(transaction.type === TransactionType.INCOME)   return total + Number(transaction.value);
      else return total;
    }, 0);

    const outcome = transactions.reduce((total, transaction) => {
      if(transaction.type === TransactionType.OUTCOME)   return total + Number(transaction.value);
      else return total;
    }, 0);

    const total = income - outcome;
    const transactionsWithBalance = {
      transactions,
      balance: {income, outcome, total}
    }
    return transactionsWithBalance;
  }
}

export default TransactionsRepository;
