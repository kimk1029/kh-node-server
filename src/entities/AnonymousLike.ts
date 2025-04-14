import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { AnonymousPost } from "./AnonymousPost";

@Entity()
export class AnonymousLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AnonymousPost, (post) => post.likes, { onDelete: "CASCADE" })
  post!: AnonymousPost;

  @Column()
  ipAddress!: string;
} 