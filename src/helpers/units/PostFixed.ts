export default abstract class PostFixed {
  public abstract get postfix(): string;
  public abstract serialized(key: string): [string, any];
}
