import { ApolloError } from "apollo-server-express";

export class ResourceNotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, "RESOURCE_NOT_FOUND");

    Object.defineProperty(this, "name", { value: "ResourceNotFoundError" });
  }
}
