import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./FreeBoard_Post";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number; // Definite assignment assertion

  @Column("text")
  content!: string; // Definite assignment assertion

  @CreateDateColumn()
  created_at!: Date; // Definite assignment assertion

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User; // Definite assignment assertion

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post; // Definite assignment assertion
}
