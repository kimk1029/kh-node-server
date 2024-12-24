import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number; // Definite Assignment Assertion

  @Column()
  title!: string; // Definite Assignment Assertion

  @Column("text")
  content!: string; // Definite Assignment Assertion

  @CreateDateColumn()
  created_at!: Date; // Definite Assignment Assertion

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  author!: User; // Definite Assignment Assertion
}
