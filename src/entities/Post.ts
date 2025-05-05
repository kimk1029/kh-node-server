// src/entities/Post.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Like } from "./Like";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ default: 0 })
  views!: number;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    onDelete: "CASCADE",
  })
  author!: User;

  @OneToMany(() => Comment, (comment) => comment?.post, { cascade: true })
  comments!: Comment[];
  @Column({
    type: "enum",
    enum: ['technology', 'science', 'health', 'business', 'entertainment', 'news'],
    default: "news",
  })
  tag!: string;

  @OneToMany(() => Like, (like) => like.post)
  likes!: Like[];
}
