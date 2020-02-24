import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link} from 'react-router-dom'
import {Table} from 'react-bootstrap'

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      paginatedNotes: [],
      categories: [],
      finishedLoading: false,
      filtering: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.filterNotes = this.filterNotes.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  componentDidMount() {
    var wasError = false;
    try{
      var { selectedCategory } = this.props.location.state;
      var { startDate } = this.props.location.state;
      var { endDate } = this.props.location.state;
      var { currentPage } = this.props.location.state;
      var { filtering } = this.props.location.state;
    }catch(err){
      wasError = true;
    }
    var url;
    if(wasError || this.state.finishedLoading){
      url = "/NotePad"
    }else{
      url = "/NotePad" + "?page=" + currentPage + "&selectedCategory=" + selectedCategory + "&startDate=" + startDate + "&endDate=" + endDate + "&filtering=" + filtering;
    }


    fetch(url)
    .then(res => res.json())
    .then(json => this.setState({ paginatedNotes: json["paginatedNotes"], 
                                  currentPage: json["currentPage"], 
                                  maxPage: json["maxPage"], 
                                  selectedCategory: json["selectedCategory"],
                                  startDate: json["startDate"],
                                  endDate: json["endDate"],
                                  categories: json["categories"],
                                  filtering: json["filtering"],
                                  finishedLoading: true,
                                  originalStartDate: json["startDate"],
                                  originalEndDate: json["endDate"] }));
    
  }


  goToPage(event){
    this.setState({finishedLoading: false});
    const value = event.target.value;
    var selectedCategory = this.state.selectedCategory;
    var startDate = this.state.startDate;
    var endDate = this.state.endDate;
    var filtering = this.state.filtering;
    if(selectedCategory === 'null')
      selectedCategory = "";
    const url = "/NotePad" + "?page=" + value + "&selectedCategory=" + selectedCategory + "&startDate=" + startDate + "&endDate=" + endDate + "&filtering=" + filtering;
    
    fetch(url)
    .then(res => res.json())
    .then(json => this.setState({ paginatedNotes: json["paginatedNotes"], 
                                  currentPage: json["currentPage"], 
                                  maxPage: json["maxPage"], 
                                  selectedCategory: json["selectedCategory"],
                                  startDate: json["startDate"],
                                  endDate: json["endDate"],
                                  categories: json["categories"],
                                  filtering: json["filtering"],
                                  finishedLoading: true,
                                  originalStartDate: json["startDate"],
                                  originalEndDate: json["endDate"] }));
  }

  filterNotes(event){
    this.setState({finishedLoading: false});
    const page = 1;
    var selectedCategory = this.state.selectedCategory;
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    const filtering = true;
    if(selectedCategory === 'null')
      selectedCategory = "";
    const url = "/NotePad" + "?page=" + page + "&selectedCategory=" + selectedCategory + "&startDate=" + startDate + "&endDate=" + endDate + "&filtering=" + filtering;
    
    fetch(url)
    .then(res => res.json())
    .then(json => this.setState({ paginatedNotes: json["paginatedNotes"], 
                                  currentPage: json["currentPage"], 
                                  maxPage: json["maxPage"], 
                                  selectedCategory: json["selectedCategory"],
                                  startDate: json["startDate"],
                                  endDate: json["endDate"],
                                  categories: json["categories"],
                                  filtering: json["filtering"],
                                  finishedLoading: true,
                                  originalStartDate: json["startDate"],
                                  originalEndDate: json["endDate"]  }));
                                  var i = 0;
  }

  deleteNote(event){
    this.setState({finishedLoading: false});
    const target = event.target;
    const IDNote = target.value;
    var selectedCategory = this.state.selectedCategory;
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    const filtering = this.state.filtering;
    var page = this.state.currentPage;
    
    if(typeof selectedCategory === 'undefined')
      selectedCategory = "";
    
    var url;
    
    if(filtering === "true")
      url = "/NotePad/" + IDNote + "?page=" + page + "&selectedCategory=" + selectedCategory + "&startDate=" + startDate + "&endDate=" + endDate + "&filtering=" + filtering;
    else
      url = "/NotePad/" + IDNote + "?page=" + page;
    
      
    var headers = {
        "Content-Type": "application/json",                                                                                                
        "Access-Control-Origin": "*"
    }; 

    fetch(url,{
      method: "DELETE",
      headers: headers
    })
    .then(res => res.json())
    .then(json => this.setState({ paginatedNotes: json["paginatedNotes"], 
                                  currentPage: json["currentPage"], 
                                  maxPage: json["maxPage"], 
                                  selectedCategory: json["selectedCategory"],
                                  startDate: json["startDate"],
                                  endDate: json["endDate"],
                                  categories: json["categories"],
                                  filtering: json["filtering"],
                                  finishedLoading: true,
                                  originalStartDate: json["startDate"],
                                  originalEndDate: json["endDate"]  }));
   }

  handleChange(event){
    this.setState({finishedLoading: false});
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if(target.type === "date")
    {
      this.setState({
        [name]: value,
        finishedLoading: true
      });
    }else{
      this.setState({
        [name]: value,
        finishedLoading: true
      });
    }
  }

  clearFilter(){
    this.setState({finishedLoading: false});
    //const url = "/NotePad" + "?page=1" + "&selectedCategory=" + "&startDate=" + originalStartDate.toISOString() + "&endDate=" + originalEndDate.toISOString() + "&filtering=" + filtering;
    const url = "/NotePad" + "?request=Clear"
    fetch(url)
    .then(res => res.json())
    .then(json => this.setState({ paginatedNotes: json["paginatedNotes"], 
                                  currentPage: json["currentPage"], 
                                  maxPage: json["maxPage"], 
                                  selectedCategory: json["selectedCategory"],
                                  startDate: json["startDate"],
                                  endDate: json["endDate"],
                                  categories: json["categories"],
                                  filtering: json["filtering"],
                                  finishedLoading: true,
                                  originalStartDate: json["startDate"],
                                  originalEndDate: json["endDate"]  }));
  }

  
  render() {
  if(!this.state.finishedLoading)
    return null;

  var cat = this.state.selectedCategory;
  const listCategories = this.state.categories.map((category) =>
    {
      if(category === cat)
        return <option value={category} selected>{category}</option>
      else
        return <option value={category}>{category}</option>
    }
  );

  var noteList = <tr></tr>;
  if(this.state.paginatedNotes.length > 0){
    this.state.paginatedNotes.map(note=>
      note.Date = note.Date.slice(0, 10)
    );
    var noteList = this.state.paginatedNotes.map((note) =>
      <tr>
        <td>{note.Date}</td>
        <td>{note.Title}</td>
        <td>
        <Link to={{pathname: '/Edit/' + note.IDNote, state:{
                 selectedCategory: this.state.selectedCategory,
                 startDate: this.state.startDate,
                 endDate: this.state.endDate,
                 currentPage: this.state.currentPage,
                 filtering: this.state.filtering }}}><button class="btn btn-success">Edit</button></Link>
          <button value={note.IDNote} onClick={this.deleteNote} class="btn btn-danger">Delete</button>
        </td>
      </tr>
    );
  }


  var  nextPageButton;
  var  prevPageButton;
  
  if(this.state.currentPage === 1){
    prevPageButton = <button disabled class="btn btn-secondary">PrevPage</button>
  }else{
    prevPageButton = <button value={this.state.currentPage-1} onClick={this.goToPage} class="btn btn-secondary">PrevPage</button>
  }
  
  if(this.state.currentPage >= (this.state.maxPage)){
    nextPageButton = <button disabled class="btn btn-secondary">NextPage</button>
  }else{
    nextPageButton = <button value={this.state.currentPage+1} onClick={this.goToPage} class="btn btn-secondary">NextPage</button>
  }


    return (
      <div className="p-5 border">
        <div className="p-3 border">
                <label>From:</label>
                <input type="date" name="startDate" value={this.state.startDate.slice(0,10)} onChange={this.handleChange} />
                
                <label>To:</label>
                <input type="date" name="endDate" value={this.state.endDate.slice(0,10)} onChange={this.handleChange} />
                
                <select name="selectedCategory" id="selectedCategory" onChange={this.handleChange}>{listCategories}</select>
                
                <button onClick={this.filterNotes} class="btn btn-info">Filter</button>
                <button onClick={this.clearFilter} class="btn btn-warning">Clear</button>
        </div>
        <div>
            <Table striped bordered hover>
              <thead>
                <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Action</th>
                </tr>
              </thead> 
              <tbody>
                {noteList}
              </tbody>
            </Table>
            <div>
              <Link to={{pathname: '/Edit', state:{
                 selectedCategory: this.state.selectedCategory,
                 startDate: this.state.startDate,
                 endDate: this.state.endDate,
                 currentPage: this.state.currentPage,
                 filtering: this.state.filtering }}}><button class="btn btn-success">New</button></Link>
            </div>
            <div>
              {prevPageButton}
              <label>Page: {this.state.currentPage}</label>
              {nextPageButton}
            </div>
        </div>
    </div>
    );
  }
}

export default App;