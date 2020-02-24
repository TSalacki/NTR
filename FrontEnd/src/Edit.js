import React from 'react';
import './App.css';
import {Link, Redirect} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

class Edit extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          IDNote: "",
          oldTitle: "",
          Title: "",
          Date: null,
          Description: "",
          categories: [],
          markdown: 0,
          finishedLoading: false,
          categoryToAdd: "",
          redirect: false

        };
        this.deleteCategory = this.deleteCategory.bind(this);
        this.handleConfirmChanges = this.handleConfirmChanges.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.handleChange = this.handleChange.bind(this);
      }

  componentDidMount() {
    var url;
    const { selectedCategory } = this.props.location.state;
    const { startDate } = this.props.location.state;
    const { endDate } = this.props.location.state;
    const { currentPage } = this.props.location.state;
    const { filtering } = this.props.location.state;
    if(typeof this.props.match.params.IDNote === 'undefined')
      url = "/Edit";
    else
      url = "/Edit/" + this.props.match.params.IDNote;
    
    fetch(url)
    .then(res => res.json())
    .then(json => {
      if(json["status"] === "Existence Error")
      { 
        alert("Note doesn't exist");
        this.setState({
          redirect: true,
          selectedCategory: selectedCategory,
          startDate: startDate,
          endDate: endDate,
          currentPage: currentPage,
          filtering: filtering,
          finishedLoading: true
        })}
      else{
        this.setState({
                                      IDNote: json["IDNote"],
                                      oldTitle: json["Title"],
                                      Title: json["Title"],
                                      Date: json["Date"],
                                      Description: json["Description"],
                                      categories: json["Categories"],
                                      markdown: (json["isMarkdown"]),
                                      Timestamp: (json["Timestamp"]),
                                      finishedLoading: true,
                                      selectedCategory: selectedCategory,
                                      startDate: startDate,
                                      endDate: endDate,
                                      currentPage: currentPage,
                                      filtering: filtering
      }) 
      }});
  }

  deleteCategory(event){
    const target = event.target;
    const categoryToDelete = target.value;
    var categoriesAfterDelete = this.state.categories;
    categoriesAfterDelete.splice( categoriesAfterDelete.indexOf(categoryToDelete), 1 );
    this.setState({
      categories: categoriesAfterDelete
    });
  }
  handleConfirmChanges(){
    var noteToSend = {
      IDNote: this.state.IDNote,
      Title: this.state.Title,
      Date: this.state.Date,
      Description: this.state.Description,
      Categories: this.state.categories,
      isMarkdown: this.state.markdown,
      Timestamp: this.state.Timestamp
    };
    var jsonString = JSON.stringify(noteToSend);
    const url = "/Edit/" + this.state.IDNote;
    var headers = {
      "Content-Type": "application/json",                                                                                                
      "Access-Control-Origin": "*"
    };      
    //new note
    if(noteToSend.IDNote === 0){
      fetch(url,{
        method: "POST",
        headers: headers,
        body: jsonString
      }).then(res=>res.text())
      .then(text=> {
        if(text !== "SUC"){
          alert(text);
          return;
        }
        else{
          this.setState({
            redirect: true
          })
        }
      });
    }else{                                                                       
      fetch(url,{
        method: "PUT",
        headers: headers,
        body: jsonString
      }).then(res=>res.text())
      .then(text=> {
        if(text !== "SUC"){
          alert(text);
          return;
        }
        else{
          this.setState({
            redirect: true
          })
        }
      });
    }
    //fetch.

  }

  addCategory(){
    var categoryToAdd = this.state.categoryToAdd;
    var categoriesList = this.state.categories;

    if(categoriesList.includes(categoryToAdd)){
      return;
    }else{
      this.setState({finishedLoading: false});
      categoriesList.push(categoryToAdd);
      this.setState({
                    categoryToAdd: "",
                    categories: categoriesList,
                    finishedLoading: true});
    }
      

  }

  handleChange(event){
    this.setState({finishedLoading: false});
    const target = event.target;
    const value = target.value;
    const name = target.name;
    
    if(target.type === "Date")
    {
      this.setState({
        [name]: value,
        finishedLoading: true
      });
    }else if(target.type === "checkbox"){
      if(this.state.markdown === 1){
        this.setState({
          markdown: 0,
          finishedLoading: true
        });
      }else{
        this.setState({
          markdown: 1,
          finishedLoading: true
        });
      }
    }else{
      this.setState({
        [name]: value,
        finishedLoading: true
      });
    }
  }

  render(){
    if(!this.state.finishedLoading)
        return null;
    if(this.state.redirect){
      return(
            <Redirect to={{pathname: '/', state:{
                                          selectedCategory: this.state.selectedCategory,
                                          startDate: this.state.startDate,
                                          endDate: this.state.endDate,
                                          currentPage: this.state.currentPage,
                                          filtering: this.state.filtering }}} ></Redirect>
      )
    }
    var noteCategories = this.state.categories.map((category)=>
      <tr>
        <td>{category}</td>
        <td><button value={category} onClick={this.deleteCategory} class="btn btn-danger">Remove</button></td>
      </tr>
    );

    var markdownCheckBox;
    if(this.state.markdown === 1){
        markdownCheckBox = <input type="checkbox" name="markdown" value={this.state.markdown} onChange={this.handleChange} checked></input>;
    }
    else{
      markdownCheckBox = <input type="checkbox" name="markdown" value={this.state.markdown} onChange={this.handleChange}></input>;
    }

    return (
      <div class="p-5 border">
        <div class="p-3 border">
            <label>Title of the note: </label>
            <input type="textbox" value={this.state.Title} onChange={this.handleChange} name="Title"></input>
            <label>Markdown:</label>
            {markdownCheckBox}
        </div>
        <div class="p-3 border">
          <label>Content of note:</label>
            <textarea class="form-control" rows="5" name="Description" value={this.state.Description} onChange={this.handleChange}></textarea>
        </div>
        <div class="p-3 border">
          <div class="row">  
            <div class="col">
              <div class="p-3 border">
                <label>In categories:</label>
                <table class="table-bordered">
                {noteCategories}
                </table>
              </div>
            </div>
            <div class="col">
              <input type="text" name="categoryToAdd" onChange={this.handleChange} value={this.state.categoryToAdd}></input>
              <button name="AddCategoryButton" onClick={this.addCategory} class="btn btn-success">Add</button>
            </div>
          </div>
        </div>
        <div>
          <label>Date:</label>
          <input type="Date" name="Date" value={this.state.Date.slice(0,10)} onChange={this.handleChange}></input>
        </div>
        <div align="center">
          <button onClick={this.handleConfirmChanges} class="btn btn-primary">OK</button>
          <Link to={{pathname: '/', state:{
                                          selectedCategory: this.state.selectedCategory,
                                          startDate: this.state.startDate,
                                          endDate: this.state.endDate,
                                          currentPage: this.state.currentPage,
                                          filtering: this.state.filtering }}} ><button class="btn btn-danger">Cancel</button></Link>
        </div>
      </div>
    );
  }
}

export default Edit;