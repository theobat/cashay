import defaultHandleErrors from '../defaultHandleErrors';
import Transport from '../Transport';
import { graphql } from 'graphql';

export default class MockTransport extends Transport {
  constructor(schema, handleErrors = defaultHandleErrors) {
    super();
    this.handleErrors = handleErrors;
    this.sendToServer =  async (request) => {
      const {query, variables} = request;
      const result = await graphql(schema, query, {}, {}, variables).catch(console.error)
      return result
    }
  }
}
