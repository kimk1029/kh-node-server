import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  post!: Post;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user!: User;
}
