import Transaction, { TransactionType } from '../models/Transaction';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: TransactionType;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', fileName);
    const readCsvStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCsvStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());

      if(!title || !type || !value) return;

      categories.push(category);
      transactions.push({title, type, value, category});
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // console.log(transactions);
    // console.log(categories);

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });

    const existentCategoriesTitles = existentCategories.map((category: Category) => category.title);

    const addCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

      const newCategories = categoriesRepository.create(
        addCategoriesTitles.map(title => ({title})),
      );
      await categoriesRepository.save(newCategories);

      const allCategories = [...newCategories, ...existentCategories];

      const createdTransactions = transactionsRepository.create(
        transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: allCategories.find(
            category => category.title === transaction.category,
          ),
        })),
      );

      await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
