import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

import uploadConfig from '../config/upload';
import multer from 'multer';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);


const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = new TransactionsRepository();

  const balance = await transactionsRepository.getBalance();

  return response.json(balance);
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;
    const createTransaction = new CreateTransactionService();

    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category
    });

    return response.json(transaction);
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const id = request.params['id'];

    const deleteTransaction = new DeleteTransactionService();

    await deleteTransaction.execute(id);

    return response.status(204).send();
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  try {
    const importTransaction = new ImportTransactionsService();
    const transactions = await importTransaction.execute(request.file.filename);

    return response.json(transactions);
  } catch(err) {
    return response.status(err.statusCode).json({error: err.message});
  }
});

export default transactionsRouter;
