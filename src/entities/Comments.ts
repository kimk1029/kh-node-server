// src/entities/Comment.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, (user) => user?.comments, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post;
}
