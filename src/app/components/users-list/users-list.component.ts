import {Component, inject, OnInit} from '@angular/core';
import {UsersApiService} from "../../services/users-api.service";
import {Observable} from "rxjs";
import {User} from "../../models/user";
import {UsersService} from "../../services/users.service";
import {AsyncPipe, NgForOf} from "@angular/common";
import {UserCardComponent} from "../user-card/user-card.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EditCreateDialogComponent} from "../edit-create-dialog/edit-create-dialog.component";
import {MatButton} from "@angular/material/button";
import {UserForm} from "../../models/form-user";
import {LocalstorageService} from "../../services/localstorage.service";
import {DeleteDialogComponent} from "../delete-dialog/delete-dialog.component";




@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    UserCardComponent,
    MatButton
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  private ApiService = inject(UsersApiService)
  private UsersService = inject(UsersService);
  private Storage = inject(LocalstorageService);

  public dialog = inject(MatDialog);
  users: Observable<User[]> = this.UsersService.users;

  constructor() {
  }
  ngOnInit(): void {
    if(this.UsersService.getUsers()){
      this.UsersService.getUsers()
    } else {
      this.ApiService.getUsers().subscribe((response: User[]) => {
        this.UsersService.setUsers(response);
        this.Storage.setItems('users',response);
      })
    }
  }

  deleteUser(userId: number): void {
    this.dialog.open(DeleteDialogComponent, {}).afterClosed()
      .subscribe((result: Boolean) => {
        if(result){
          this.UsersService.deleteUser(userId)
          this.Storage.deleteUser(userId)
        }
      })
  }

  openDialog(user?:User): void {
    this.dialog.open(EditCreateDialogComponent, {
      data:{user:user,isEdit: !!user},
    }).afterClosed().subscribe((response: UserForm) => {
      if(response){
        if(user){
          const userId = user.id
          this.UsersService.editUser({id: userId,...response});

        } else {
          this.UsersService.createUser(response);
        }
      }
    })
  }
}
